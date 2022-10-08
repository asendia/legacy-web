import type { TranslationData } from './translation';

export const translationData: TranslationData = {
	// Index page
	title: 'Sejiwo - Your testament in the cloud',
	description: 'Sejiwo is a secure testament storage and delivery service',
	login: 'login',
	logout: 'logout',
	emailListTo: 'To',
	emailListPlaceholder: 'Recipient emails',
	emailListValidity: 'Email address should conform to name@host.com',
	contentPlaceholder: 'Message is encrypted by default',
	show: 'show',
	hide: 'hide',
	on: 'on',
	off: 'off',
	loading: 'Loading...',
	draftConflict: 'Data conflict, do you want to use data from the server instead?',
	draftRecipients: 'Recipients',
	draftContent: 'Content',
	backupSecret:
		'Please make a copy of this secret and send it to the recipients. ' +
		'No one will be able to decrypt the message if you lost it.',
	provideSecret:
		'It seems like your message is encrypted. ' +
		'Please enter your secret if you wish to decrypt it.',
	authUndefined: 'You need to login first',
	authExpired: 'Session expired, want to backup the content first?',
	formSubmit: 'submit',
	messageExtended: 'Message has been extended!',
	messageUnsubscribed: 'Message has been unsubscribed!',
	queryActionError: 'Probably you have already used this extension url. Redirect to home?',
	scheduler_pt1: 'Send this message to recipients after',
	scheduler_pt2: 'of inactivity. Every',
	scheduler_pt3: 'a reminder will be sent to',
	yourEmailPlaceholder: 'me',
	schedulerDays: 'days',
	sourceCode: 'source code'
};
