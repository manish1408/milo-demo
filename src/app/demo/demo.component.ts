import { Component, ViewChild } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ToastService } from "../_services/toast.service";
import { finalize } from "rxjs";
import { LeadService } from "../_services/leads.service";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.scss'
})
export class DemoComponent {

  loading: boolean = false;
  leadDetail:any;
  id:any;
  websiteURL:any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private toastService: ToastService,
    private leadService: LeadService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    if(this.route.snapshot.queryParams["website"]) {
      this.id = this.route.snapshot.queryParams["website"];
      this.websiteURL = this.sanitizer.bypassSecurityTrustResourceUrl("https://" + this.id); ;
    }
    this.getLeadDetail(this.id);
  }

  openchatbot() {
    document.getElementById("chatbot-button-sightera")?.click();
  }
  getLeadDetail(rootDomainName: string) {
    this.leadService
      .getLeadDetail(rootDomainName)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res?.success == true && res?.data) {
            this.leadDetail = res.data;
          } else {
            this.leadDetail = {};
          }
        },
        error: (err) => {
          console.log("err: ", err);
          this.toastr.error(err.error.detail.error);
        },
      });
  }
}
