/*
    开启国际化的步骤:
        1. 安装依赖 npm install react-intl --save   npm install atool-l10n babel-plugin-react-intl --save-dev
        2. 在webpack配置中添加babel-plugin-react-intl插件
        3. 执行 npm run trans 进行翻译
*/

import { LocaleProvider } from "antd";
import zhCN from 'antd/lib/locale-provider/zh_CN';

const isStartIntl = false;      // 是否开启国际化

// TODO 开启国际化后将注释打开

// import { addLocaleData, IntlProvider } from 'react-intl';
//
// import zhLocaleData from 'react-intl/locale-data/zh';
// import zhMessages from '../locales/zh.json';
//
// import enUS from 'antd/lib/locale-provider/en_US';
// import enLocaleData from 'react-intl/locale-data/en';
// import enMessages from '../locales/en.json';
//
// const lang = {
//     zh: {
//         antdLocale: zhCN,
//         intlLocale: "zh",
//         intlMessages: {...zhMessages},
//         localeData: zhLocaleData
//     },
//     en: {
//         antdLocale: enUS,
//         intlLocale: "en",
//         intlMessages: {...enMessages},
//         localeData: enLocaleData
//     },
// };


export default function LocaleWrapper({children}){

    if(!isStartIntl) {
        return (
            <LocaleProvider locale={zhCN}>
                {children}
            </LocaleProvider>
        );
    }else {
        // TODO 开启国际化后将注释打开
        // const { antdLocale, intlLocale, intlMessages, localeData } = lang["zh"];
        //
        // addLocaleData(localeData);
        // return (
        //     <LocaleProvider locale={antdLocale}>
        //         <IntlProvider locale={intlLocale} messages={{...intlMessages}}>
        //             {children}
        //         </IntlProvider>
        //     </LocaleProvider>
        // )
    }


}

