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
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
declare var window:any;

@Component({
  selector: "app-demo",
  templateUrl: "./demo.component.html",
  styleUrl: "./demo.component.scss",
})
export class DemoComponent {
  loading: boolean = false;
  leadDetail: any;
  id: any;
  websiteURL: any;
  chatbotid: any;
  cleanUrl:any;
  showCallButton = false; 
  audioBotURL:SafeResourceUrl=""
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
    if (this.route.snapshot.queryParams["website"]) {
      this.id = this.route.snapshot.queryParams["website"];
      this.websiteURL = this.sanitizer.bypassSecurityTrustResourceUrl(
        "https://www." + this.id
      );
      this.cleanUrl = this.id;
      this.getLeadDetail(this.id);
    }
    if (this.route.snapshot.queryParams["lid"]) {
      this.id = this.route.snapshot.queryParams["lid"];
      this.websiteURL = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.route.snapshot.queryParams["url"]
      );
      this.cleanUrl = this.route.snapshot.queryParams["url"].replace("https://" , "").replace("http://" , "");
      this.getLeadDetailbyId(this.id);
    }
    if(window.location.href.indexOf('veolia') > -1 || window.location.href.indexOf('secureprivacy') > -1) {
      this.showCallButton = true;
    }
  }

  injectChatbotScript(chatbotId:any) {
    // Create a new script element
    const script = document.createElement("script");

    // Set the src attribute with the chatbot ID as a query parameter
    script.src = `https://app.miloassistant.ai/agent/build/chatbot.min.js?id=${encodeURIComponent(
      chatbotId
    )}`;

    // Set the script type
    script.type = "text/javascript";

    // Append the script element to the <head> section
    document.head.appendChild(script);

    window.setTimeout(() => {
      window.initializeMiloChatbot();
    }, 1000);
    console.log(`Chatbot script injected with ID: ${chatbotId}`);
  }
  openchatbot() {
    document.getElementById("chatbot-button-milodcl")?.click();
  }
  loadAudioBot(chatbotId: string,chatbotName:string) {
    const domain = chatbotName; // Replace with the appropriate domain if needed
    this.audioBotURL = this.sanitizer.bypassSecurityTrustResourceUrl(`https://realtime-audio-agent.vercel.app/?chatbotId=${chatbotId}&domain=${domain}`);  
    console.log(this.audioBotURL);
  }
  getLeadDetail(rootDomainName: string) {
    this.leadService
      .getLeadDetail(rootDomainName)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res?.success == true && res?.data) {
            this.leadDetail = res.data;
            this.chatbotid = this.leadDetail.chatbot;
            this.injectChatbotScript(this.chatbotid);
            const chatbotName =res.data?.company ? res.data?.company : res.data?.rootDomain
            this.loadAudioBot(this.chatbotid,chatbotName);
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
  getLeadDetailbyId(leadId: string) {
    this.leadService
      .getLeadDetailById(leadId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res?.success == true && res?.data) {
            this.leadDetail = res.data;
            this.chatbotid = this.leadDetail.chatbot;
            this.injectChatbotScript(this.chatbotid);
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
