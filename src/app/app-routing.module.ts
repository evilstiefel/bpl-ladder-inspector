import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'ladder',
    pathMatch: 'full'
  },
  { 
    path: 'ladder',
    loadChildren: () => import('./ladder/ladder.module').then((m) => m.LadderModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
