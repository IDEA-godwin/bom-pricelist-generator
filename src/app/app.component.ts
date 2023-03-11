import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import jsPDF from 'jspdf';
import pricelists from '../assets/data/pricelists.json';

type entries = [string, number][];

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit  {

  pageTitle = 'BOM-pricelist-generator';
  showList = false;
  error = false;
  vendorList: string[] = [];
  form: FormGroup;

  title: string = "";
  vendor: string = "";
  selectedItems: Array<any> = [];
  totalAmount: number = 0

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {

    this.form = fb.group({
      title: ["", Validators.required],
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

    if (!this.form.get("title")?.valid) {
      this.error = true;
      return;
    }

    let formRawData = this.form.getRawValue();
    this.title = formRawData.title;
    this.vendor = formRawData.vendor;
    this.selectedItems = formRawData.items.filter((x: any) => x.selected);
    this.totalAmount = formRawData.items.map((x: any) => (x.price * x.quantity)).reduce((x: number, y: number) => x + y);

    this.modalService.open(content, { ariaLabelledBy: 'pricelist-preview-modal' }).result.then()
  }

  saveListToPdf() {
    let filename = this.title;
    const list = document.getElementById("list-preview");
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
    });
    doc.html(list!, {
      margin: [40, 40, 40, 40],
      callback: function (doc) {
        doc.save(`${filename}.pdf`);
      }
    })
    this.form.reset();
    this.items.clear();
    this.modalService.dismissAll();
    // const pdfTable = this.listPreview.nativeElement;
    // var html = htmlToPdfmake(list.innerHTML);

    // const documentDefinition = { content: html };
    // pdfMake.createPdf(documentDefinition).open();

  }
}
