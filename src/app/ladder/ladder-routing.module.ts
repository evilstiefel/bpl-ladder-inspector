import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LadderOutletComponent } from './components/ladder-outlet/ladder-outlet.component';
import { LadderOverviewComponent } from './components/ladder-overview/ladder-overview.component';

const routes: Routes = [{
  path: '',
  component: LadderOutletComponent,
  children: [{
    path: '',
    component: LadderOverviewComponent
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LadderRoutingModule { }
