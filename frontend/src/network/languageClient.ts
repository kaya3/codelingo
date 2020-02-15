import { request } from './request';

export const languageClient = {

    setLanguage(language: string): void {
        request.postData(`/choose_language/${language}`, '');
    },
}
