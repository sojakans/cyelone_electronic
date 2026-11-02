import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from '../locales/en.json';import ta from '../locales/ta.json';import si from '../locales/si.json';
let language='en';try{language=localStorage.getItem('ce-language')||'en';}catch{}
i18n.use(initReactI18next).init({resources:{en:{translation:en},ta:{translation:ta},si:{translation:si}},lng:['en','ta','si'].includes(language)?language:'en',fallbackLng:'en',keySeparator:false,interpolation:{escapeValue:false}});
i18n.on('languageChanged',lng=>{document.documentElement.lang=lng;try{localStorage.setItem('ce-language',lng);}catch{}});
document.documentElement.lang=i18n.language;export default i18n;
