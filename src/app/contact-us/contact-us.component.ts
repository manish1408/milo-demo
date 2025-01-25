import { ɵBrowserAnimationBuilder } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { LeadService } from "../_services/leads.service";

@Component({
  selector: "app-contact-us",
  templateUrl: "./contact-us.component.html",
  styleUrl: "./contact-us.component.scss",
})
export class ContactUsComponent {
  contactForm!: FormGroup;
  isLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private leadService: LeadService,
    private el: ElementRef
  ) {}
  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ["", Validators.required],
      company: ["", Validators.required],
      phone1: ["", Validators.required],
      email: ["", [Validators.required, Validators.email,this.businessEmailValidator()]],
      rootDomain: ["", [Validators.required,this.websiteValidator()]],
      phoneCode: ["+1", Validators.required],
    });
  }
// Custom validator for business email
businessEmailValidator() {
  const blockedDomains = ['gmail.com', 'google.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'msn.com'];

  return (control: AbstractControl) => {
    const email = control.value;
    if (email) {
      const domain = email.split('@')[1]?.toLowerCase();
      if (blockedDomains.includes(domain)) {
        return { invalidBusinessEmail: true };
      }
    }
    return null;
  };
}

// Custom validator for website URL
websiteValidator() {
  const urlRegex =
    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/; // Regex for validating URLs
  return (control: AbstractControl) => {
    const website = control.value;
    if (website && !urlRegex.test(website)) {
      return { invalidWebsite: true };
    }
    return null;
  };
}

  hasError(controlName: keyof typeof this.contactForm.controls) {
    const control = this.contactForm.controls[controlName];
    return control.invalid && control.touched;
  }
  hasEmailFormatError() {
    return (
      this.contactForm.controls["email"].hasError("email") &&
      this.contactForm.controls["email"].touched
    );
  }
  hasInvalidBusinessEmailError(): boolean {
    const control = this.contactForm.controls['email'];
    return control.hasError('invalidBusinessEmail') && control.touched;
  }

  hasWebsiteFormatError(): boolean {
    const control = this.contactForm.controls['rootDomain'];
    return control.hasError('invalidWebsite') && control.touched;
  }

  onSubmit() {
    this.isLoading = true;
    this.contactForm.markAllAsTouched();
    if (this.contactForm.invalid) {
      this.isLoading = false;
      this.toastr.error("Please provide all the details");
      return;
    }
    const reqObj = {
      rootDomain: this.contactForm.value.rootDomain,
      company: this.contactForm.value.company,
      contacts: [
        {
          name: this.contactForm.value.name,
          linkedin: '',
          email: this.contactForm.value.email,
          phone1: this.contactForm.value.phoneCode + this.contactForm.value.phone1,
          phone2: '',
          status: '',
          sent_on: '',
        },
      ],
    };
    console.log(reqObj);
    this.leadService.createLead(reqObj).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.toastr.success('Thanks for submitting');
          this.contactForm.reset();
        } else {this.toastr.error('An error occurred while submitting');}
      },
      (error:any) => {
        this.isLoading = false;
        console.error('Error occurred:', error);
        this.toastr.error('An error occurred while submitting');
      }
    );
  }
 
}
