import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import pricelists from '../assets/data/pricelists.json';

type entries = [string, number][];

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  // stylesUrls: []
})
export class AppComponent implements OnInit  {

  title = 'BOM-pricelist-generator';
  vendorList: string[] = [];
  showList: boolean = false;

  form: FormGroup;

  vendor: string = "";
  selectedItems: Array<any> = [];
  totalAmount: number = 0;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {

    this.form = fb.group({
      vendor: ["", Validators.required],
      items: fb.array([ ])
    })

    this.form.get("vendor")?.valueChanges.subscribe(value => {
      let vendoItems = Object.values(pricelists)[this.vendorList.indexOf(value)];
      this.showList = true;
      this.addItems(Object.entries(vendoItems));
    })
  }

  ngOnInit(): void {
    this.vendorList = Object.keys(pricelists);
  }

  get items() {
    return this.form.controls['items'] as FormArray;
  }

  addItems(itemsEntries: entries) {

    this.items.clear();
    itemsEntries.forEach(element => {
      const itemsForm: FormGroup = this.fb.group({
        selected: new FormControl(""),
        component: new FormControl(element[0]),
        price: new FormControl(element[1]),
        quantity: new FormControl("", [Validators.min(0)])
      })
      itemsForm.get("component")?.disable();
      itemsForm.get("price")?.disable();
      itemsForm.get("quantity")?.disable();

      this.items.push(itemsForm);
    });
  }

  selectItem(index: number) {
    let item =  this.items.controls[index];
    if(item.get("selected")?.value){
      this.items.controls[index].get("quantity")?.enable();
      this.items.controls[index].patchValue({
        quantity: 1
      });
    } else {
      this.items.controls[index].get("quantity")?.disable();
      this.items.controls[index].get("quantity")?.reset();
    }
  }

  previewSelection(content: any) {

    let formRawData = this.form.getRawValue();
    this.vendor = formRawData.vendor;
    this.selectedItems = formRawData.items.filter((x: any) => x.selected);
    this.totalAmount = formRawData.items.map((x: any) => (x.price * x.quantity)).reduce((x: number, y: number) => x + y);

    this.modalService.open(content, { ariaLabelledBy: 'pricelist-preview-modal' }).result.then(result => {

    })
  }


}
