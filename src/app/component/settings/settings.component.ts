import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AppConstants } from 'src/app/common/app-constants';
import { Country } from 'src/app/model/country';
import { UpdateUserInfo } from 'src/app/model/update-user-info';
import { User } from 'src/app/model/user';
import { AuthService } from 'src/app/service/auth.service';
import { CountryService } from 'src/app/service/country.service';
import { UserService } from 'src/app/service/user.service';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { RepeatPasswordMatcher } from 'src/app/common/repeat-password-matcher';
import { UpdateUserEmail } from 'src/app/model/update-user-email';
import { Router } from '@angular/router';
import { UpdateUserPassword } from 'src/app/model/update-user-password';
import * as moment from 'moment';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
	authUser: any;
	authUserId: number;
	submittingForm: boolean = false;
	countryList: Country[] = [];
	updateInfoFormGroup: FormGroup = this.formBuilder.group({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(64)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(64)]),
    description: new FormControl('', [Validators.maxLength(100)]),
    address: new FormControl('', [Validators.maxLength(128)]),
    education: new FormControl('', [Validators.maxLength(128)]),
    gender: [null],
    dob: ['']
  });
	updatePasswordFormGroup: FormGroup = this.formBuilder.group({
    password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]),
    passwordRepeat: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]),
    oldPassword: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(32)])
  });
	repeatPasswordMatcher = new RepeatPasswordMatcher();

	private subscriptions: Subscription[] = [];

	constructor(
		private authService: AuthService,
		private userService: UserService,
		private formBuilder: FormBuilder,
		private matSnackbar: MatSnackBar,
		private router: Router) { }

	matchPasswords: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
		const password = group.get('password').value;
		const passwordRepeat = group.get('passwordRepeat').value;
		return password === passwordRepeat ? null : { passwordMissMatch: true }
	}

	ngOnInit(): void {
		if (!this.authService.isUserLoggedIn()) {
			this.router.navigateByUrl('/login');
		} else {
      this.userService.getUserById(this.authService.getAuthUserId()).subscribe((data) => {
        this.authUser = data;
        this.updateInfoFormGroup = this.formBuilder.group({
          firstName: new FormControl(this.authUser.firstName, [Validators.required, Validators.maxLength(64)]),
          lastName: new FormControl(this.authUser.lastName, [Validators.required, Validators.maxLength(64)]),
          description: new FormControl(this.authUser.description, [Validators.maxLength(100)]),
          address: new FormControl(this.authUser.address, [Validators.maxLength(128)]),
          education: new FormControl(this.authUser.education, [Validators.maxLength(128)]),
          gender: [this.authUser.gender],
          dob: [this.authUser.dob]
        });

        this.updatePasswordFormGroup = this.formBuilder.group({
          password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]),
          passwordRepeat: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]),
          oldPassword: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(32)])
        }, { validators: this.matchPasswords });
      })
		}
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	handleUpdateInfo(): void {
		this.submittingForm = true;
		const updateUserInfo = new UpdateUserInfo();
		updateUserInfo.firstName = this.updateInfoFormGroup.controls['firstName'].value;
		updateUserInfo.lastName = this.updateInfoFormGroup.controls['lastName'].value;
		updateUserInfo.description = this.updateInfoFormGroup.controls['description'].value;
		updateUserInfo.address = this.updateInfoFormGroup.controls['address'].value;
		updateUserInfo.education = this.updateInfoFormGroup.controls['education'].value;
		updateUserInfo.dob = moment(this.updateInfoFormGroup.controls['dob'].value).format('YYYY-MM-DD HH:mm:ss').toString();
		updateUserInfo.gender = this.updateInfoFormGroup.controls['gender'].value;

		this.subscriptions.push(
			this.userService.updateUserInfo(this.authUser.id, updateUserInfo).subscribe({
				next: (updatedUser: User) => {
          updatedUser = {
            ...updatedUser,
            id: this.authUser.id
          }
          localStorage.setItem('authUser', JSON.stringify(updatedUser));
					this.matSnackbar.openFromComponent(SnackbarComponent, {
						data: 'Cập nhật thông tin thành công',
						panelClass: ['bg-success'],
						duration: 5000
					});
					this.submittingForm = false;
					this.router.navigateByUrl('/profile');
				},
				error: (errorResponse: HttpErrorResponse) => {
					const validationErrors = errorResponse.error.validationErrors;
					if (validationErrors != null) {
						Object.keys(validationErrors).forEach(key => {
							const formControl = this.updateInfoFormGroup.get(key);
							if (formControl) {
								formControl.setErrors({
									serverError: validationErrors[key]
								});
							}
						});
					} else {
						this.matSnackbar.openFromComponent(SnackbarComponent, {
							data: AppConstants.snackbarErrorContent,
							panelClass: ['bg-danger'],
							duration: 5000
						});
					}
					this.submittingForm = false;
				}
			})
		);
	}

	handleUpdatePassword(): void {
		this.submittingForm = true;
		const updateUserPassword = new UpdateUserPassword();
		updateUserPassword.password = this.updatePasswordFormGroup.get('password').value;
		updateUserPassword.passwordRepeat = this.updatePasswordFormGroup.get('passwordRepeat').value;
		updateUserPassword.oldPassword = this.updatePasswordFormGroup.get('oldPassword').value;

		this.subscriptions.push(
			this.userService.updateUserPassword(updateUserPassword).subscribe({
				next: (result: any) => {
					localStorage.setItem(AppConstants.messageTypeLabel, AppConstants.successLabel);
					localStorage.setItem(AppConstants.messageHeaderLabel, AppConstants.passwordChangeSuccessHeader);
					localStorage.setItem(AppConstants.messageDetailLabel, AppConstants.passwordChangeSuccessDetail);
					localStorage.setItem(AppConstants.toLoginLabel, AppConstants.trueLabel);
					this.authService.logout();
					this.submittingForm = false;
					this.router.navigateByUrl('/message');
				},
				error: (errorResponse: HttpErrorResponse) => {
					const validationErrors = errorResponse.error.validationErrors;
					if (validationErrors != null) {
						Object.keys(validationErrors).forEach(key => {
							const formControl = this.updateInfoFormGroup.get(key);
							if (formControl) {
								formControl.setErrors({
									serverError: validationErrors[key]
								});
							}
						});
					} else {
						this.matSnackbar.openFromComponent(SnackbarComponent, {
							data: AppConstants.snackbarErrorContent,
							panelClass: ['bg-danger'],
							duration: 5000
						});
					}
					this.submittingForm = false;
				}
			})
		);
	}
}
