import React, { Fragment, Component} from 'react';
import {observer, inject} from 'mobx-react';
// import { FormattedMessage } from 'react-intl';

import styles from './index.scss';
import { Table, Button } from 'antd';
import prompt from 'utils/prompt';
import { helper } from 'utils/T';
import { MainContent, MainHeader } from 'layouts/MainLayout'
import widthModal from 'components/Hoc/widthModal';
import Create from './Create';
import PropTypes from 'prop-types';

@inject((stores) => ({
    listStore: stores.screen.listStore,
    createStore: stores.screen.createStore,
}))
@observer
export default class Screen extends Component{
    static propTypes = {
        modalControl: PropTypes.object,
    };

    columns = [
        {
            title: '姓名',
            dataIndex: 'name',
        },
        {
            title: '年龄',
            dataIndex: 'age',
        },
        {
            title: '住址',
            dataIndex: 'address',
        },
        {
            title: "操作",
            render: (text, record) => (
                <Fragment>
                    <Button type="primary" icon="edit" onClick={() => this.renderCreateModal(record.id)}>编辑</Button>

                    <Button
                        type="danger"
                        icon="delete"
                        style={{marginLeft: 5}}
                        onClick={() => prompt.confirm(() => this.props.listStore.delItem(record.id))}
                    >删除</Button>
                </Fragment>
            )
        }
    ];

    componentDidMount(){
        this.props.listStore.fetchPageList();
    }


    renderCreateModal = (screen_id) => {
        const CreateModal = widthModal(Create);
        helper.mountReact(<CreateModal
            modalProps={{title: screen_id ? "编辑" :"创建"}}
            screen_id={screen_id}
            createStore={this.props.createStore}
            listStore={this.props.listStore}
        />)
    };


    render(){
        const { data, loading } = this.props.listStore;

        return (
            <MainContent className={styles.screen}>
                <MainHeader title="可视化列表" rightRender={<Button icon="plus" onClick={() => this.renderCreateModal()}>创建</Button>}/>

                {/* 国际化调用 */}
                {/*<FormattedMessage*/}
                    {/*id="Screen.test"*/}
                    {/*defaultMessage={'你有条新信息'}*/}
                    {/*values={{unreadCount: 10}}*/}
                {/*/>*/}

                <Table
                    loading={loading}
                    dataSource={data.rows}
                    columns={this.columns}
                    rowKey={(row) => row.name}
                    pagination={{
                        total: data.count,
                        pageSize: 15
                    }}
                />
            </MainContent>
        )
    }
}
