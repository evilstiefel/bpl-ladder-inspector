import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, interval, Observable } from 'rxjs';
import { LadderEntry, TeamNames } from 'src/app/shared/shared/models/ladder-entry';
import { BPLLadderService } from 'src/app/shared/shared/services/bplladder.service';

import { debounceTime, distinctUntilChanged, map, publishReplay, refCount, startWith, switchMap, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { RankInfo } from '../../models/rank-info';
import { stringify } from '@angular/compiler/src/util';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

@Component({
  selector: 'app-ladder-overview',
  templateUrl: './ladder-overview.component.html',
  styleUrls: ['./ladder-overview.component.scss']
})
export class LadderOverviewComponent {

  ladder$: Observable<LadderEntry[]>;

  playerCount$: Observable<number>;

  accountName$ = new BehaviorSubject<string>('');
  
  className$: Observable<string | undefined>;

  topCharacter$: Observable<LadderEntry | undefined>;

  accountNames$: Observable<string[]>;

  rankInfo$: Observable<RankInfo>;

  teamName$: Observable<string | undefined>;

  accountControl = new FormControl({ value: undefined, disabled: true });

  statistics$: Observable<any> | undefined;

  ladderStatistics$: Observable<any> | undefined;

  constructor(
    private ladderService: BPLLadderService
  ) {

    this.ladder$ = interval(60000).pipe(
      startWith(0),
      switchMap(() => this.ladderService.ladder$),
      map((ladder) => ladder.filter(entry => entry.team_name !== '')),
      publishReplay(1),
      refCount()
    );

    this.playerCount$ = this.ladder$.pipe(
      startWith([]),
      map((list) => list.length || 0),
      tap((count) => {
        if (count > 0) {
          this.accountControl.enable({ emitEvent: false });
        }
      })
    );

    this.topCharacter$ = combineLatest([
      this.ladder$,
      this.accountName$
    ]).pipe(
      map(([ladder, accountName]) => ladder.filter(elem => elem['account_name'].toLocaleLowerCase() === accountName.toLocaleLowerCase()).sort((a, b) => a['rank'] < b['rank'] ? -1 : 1).pop()),
      publishReplay(1),
      refCount()
    );

    this.rankInfo$ = combineLatest([
      this.ladder$,
      this.accountName$
    ]).pipe(
      map(([ladder, accountName]) => this.calculateRanks(accountName, ladder))
    );

    this.accountNames$ = this.ladder$.pipe(
      map(ladder => {
        return ladder.reduce((acc, cur) => acc.concat(cur.account_name), [] as string[])
      })
    );

    this.teamName$ = this.topCharacter$.pipe(
      map((character) => character?.team_name)
    );

    this.className$ = this.topCharacter$.pipe(
      map((character) => character?.character_class)
    );

    this.ladderStatistics$ = this.ladder$.pipe(
      map((ladder) => {
        const statsMap = ladder.reduce((acc, current) => {
          if (acc.get(current.team_name)) {
            acc.set(current.team_name, acc.get(current.team_name)! + 1);
          } else {
            acc.set(current.team_name, 1)
          }
          return acc;
        }, new Map<TeamNames, number>());
        return ({ statsMap, ladder });
      }),
      map(({statsMap, ladder }) => {
        for (let [key, value] of statsMap) {
          statsMap.set(key, value / ladder.length * 100)
        }
        return statsMap;
      })
    );

    this.statistics$ = this.ladder$.pipe(
      map((ladder) => ladder.slice(0, 100)),
      map((top100) => {
        const statsMap = top100.reduce((acc, current) => {
          if (acc.get(current.team_name)) {
            acc.set(current.team_name, acc.get(current.team_name)! + 1);
          } else {
            acc.set(current.team_name, 1)
          }
          return acc;
        }, new Map<TeamNames, number>());
        return statsMap;
      })
    );

  }

  private calculateRanks(accountName: string, ladder: LadderEntry[]): RankInfo {
    const classMap = new Map();
    ladder.reduce((acc, current) => {
      const charClass = current['character_class'];
      const teamName = current['team_name'];
      if (classMap.has(charClass)) {
        classMap.set(charClass, classMap.get(charClass).concat(current));
      } else {
        classMap.set(charClass, [current]);
      }
      if (classMap.has(teamName)) {
        classMap.set(teamName, classMap.get(teamName).concat(current));
      } else {
        classMap.set(teamName, [current]);
      }
      return acc;
    }, classMap);
    const firstRanked = ladder.filter(elem => elem['account_name'].toLocaleLowerCase() === accountName.toLocaleLowerCase()).sort((a, b) => a['rank'] < b['rank'] ? -1 : 1).pop();
    const classRank = firstRanked
      ? classMap.get(firstRanked['character_class']).indexOf(firstRanked) + 1
      : 'N/A';
    const teamRank = firstRanked
      ? classMap.get(firstRanked['team_name']).indexOf(firstRanked) + 1
      : 'N/A';
    
    return ({
      ladderRank: firstRanked ? firstRanked.rank : 'N/A',
      teamRank,
      classRank,
    })
  }

  public typeaheadSelected(event: TypeaheadMatch): void {
    this.accountName$.next(event.item);
  }

}
