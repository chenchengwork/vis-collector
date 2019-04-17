import React, { Component } from 'react';

import styles from './index.scss';
import { MainContent, MainHeader } from 'layouts/MainLayout'
import PropTypes from 'prop-types';

import Video from 'components/Video';


export default class Screen extends Component{
    static propTypes = {
        modalControl: PropTypes.object,
    };

    render(){

        return (
            <MainContent className={styles.screen}>
                <MainHeader title="可视化列表" />

                <Video url="rtmp://live.hkstv.hk.lxdns.com/live/hks1" type="rtmp/mp4" />

            </MainContent>
        )
    }
}
