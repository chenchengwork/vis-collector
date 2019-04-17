import React  from "react";
import { Provider } from 'mobx-react';
import Router from './router';
import LocaleWrapper from './intl';
import store from './store';

export default () => (
    <LocaleWrapper>
        <Provider {...store}>
            <Router />
        </Provider>
    </LocaleWrapper>
);
