import { Component } from '@angular/core';
import { combineLatest, interval, Observable } from 'rxjs';
import { LadderEntry } from 'src/app/shared/shared/models/ladder-entry';
import { BPLLadderService } from 'src/app/shared/shared/services/bplladder.service';

import { debounceTime, distinctUntilChanged, first, map, publishReplay, refCount, startWith, switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { RankInfo } from '../../models/rank-info';

@Component({
  selector: 'app-ladder-overview',
  templateUrl: './ladder-overview.component.html',
  styleUrls: ['./ladder-overview.component.scss']
})
export class LadderOverviewComponent {

  ladder$: Observable<LadderEntry[]>;

  playerCount$: Observable<number>;

  accountName$: Observable<string>;

  rankInfo$: Observable<RankInfo>;

  accountControl = new FormControl();

  constructor(
    private ladderService: BPLLadderService
  ) {

    this.ladder$ = interval(60000).pipe(
      startWith(0),
      switchMap(() => this.ladderService.ladder$),
      publishReplay(1),
      refCount()
    );

    this.playerCount$ = this.ladder$.pipe(
      map((list) => list.length || 0)
    );

    this.accountName$ = this.accountControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    );

    this.rankInfo$ = combineLatest([
      this.ladder$,
      this.accountName$
    ]).pipe(
      map(([ladder, accountName]) => this.calculateRanks(accountName, ladder))
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

}
