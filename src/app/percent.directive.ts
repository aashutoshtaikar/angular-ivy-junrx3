import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgModel } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

@Directive({
  selector: '[appPercent]',
  providers: [NgModel, DecimalPipe]
})
export class PercentDirective {
 @Input('decimals') decimals: number = 0;
  @Input('digit') digit: number = 1;

  private check(value: string, decimals: number, digit: number) {
    if (decimals <= 0) {
      return String(value).match(new RegExp(/^\d+$/));
    } else {
      var regExpString = `^\\s*?(\\d[0-9]{0,${digit}}(\\.\\d{0,${decimals}})?)\\s*$`
      return String(value).match(new RegExp(regExpString,'gm'));
    }
  }

  private specialKeys = [
    'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'
  ];

  constructor(private el: ElementRef, private model: NgModel, private decimalPipe: DecimalPipe) {
  }

  ngOnInit(){
    console.log('here directive', this.el, parseFloat(this.model.model));
    let decimalZeroes = "0".repeat(this.decimals);
    let uiValue: string = `0.${decimalZeroes}`;
    let parsedValue: number =  parseFloat(this.model.model);
 
    if (parsedValue>100.0) {
      uiValue = "100.00";
    } else if(!isNaN(parsedValue)){
      console.log('here directive2');

      // this.model.valueAccessor.writeValue(parsedValue);
      uiValue = this.decimalPipe.transform(parsedValue,'1.'+ this.decimals + '-' + this.decimals);
    }

    this.el.nativeElement.value = uiValue + '%';
    console.log('here directive3', this.el.nativeElement.value);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    let selectShortcut = event.ctrlKey && event.key=='a';
    let copyShortcut = event.ctrlKey && event.key=='c';
    let pasteShortcut = event.ctrlKey && event.key=='v';
    let undoShortcut = event.ctrlKey && event.key=='z';

    let ifAnyShortcut = selectShortcut || copyShortcut || pasteShortcut || undoShortcut;
    // console.log('ifAnyShortcut', ifAnyShortcut);
    if (ifAnyShortcut || this.specialKeys.indexOf(event.key) !== -1) {
      // console.log('ifAnyShortcut', ifAnyShortcut);
      return;
    }
    
    let current: string = this.el.nativeElement.value;
    let position: number = this.el.nativeElement.selectionStart;
    let next: string = [current.slice(0, position), event.key, current.slice(position)].join('');
    if (next && !this.check(next, this.decimals, this.digit)) {
      // console.log('preventing deafult', event.key);
      event.preventDefault();
      return next;
    }

  }

  @HostListener("blur")
  onBlur() {
    let decimalZeroes = "0".repeat(this.decimals);
    let uiValue: string = `0.${decimalZeroes}`;
    let onBlurValue: string = this.el.nativeElement.value;
    let parsedValue: number =  parseFloat(onBlurValue);

    if (parsedValue>100.0) {
      uiValue = "100.00";
    } else if(!isNaN(parsedValue)){
      this.model.update.emit(parsedValue);
      uiValue = this.decimalPipe.transform(parsedValue,'1.'+ this.decimals + '-' + this.decimals);
    }
    this.el.nativeElement.value = uiValue + '%';
  }

  @HostListener("focus")
  onFocus() {
    let next1: string = this.el.nativeElement.value;
    if (next1.indexOf('%') != -1) {
      this.el.nativeElement.value = next1.substring(0, next1.length - 1);
    }

  }

}