import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TypeaheadModule.forRoot()
  ],
  exports: [
    ReactiveFormsModule,
    TypeaheadModule,
  ]
})
export class SharedModule { }
