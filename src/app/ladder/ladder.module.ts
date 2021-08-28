import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LadderRoutingModule } from './ladder-routing.module';
import { LadderOutletComponent } from './components/ladder-outlet/ladder-outlet.component';
import { LadderOverviewComponent } from './components/ladder-overview/ladder-overview.component';
import { SharedModule } from '../shared/shared/shared.module';


@NgModule({
  declarations: [
    LadderOutletComponent,
    LadderOverviewComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    LadderRoutingModule
  ]
})
export class LadderModule { }
