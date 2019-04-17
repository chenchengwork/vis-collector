import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Form, Input } from 'antd';
import Box from 'components/Box';
const FormItem = Form.Item;

@observer
class Create extends Component {
    static propTypes = {
        modalControl: PropTypes.object,
        screen_id: PropTypes.string,
        createStore: PropTypes.object,
        listStore: PropTypes.object,
    };

    componentDidMount(){
        this.props.modalControl.registerOk(this.handleSubmit);
        this.loadData();
    }

    loadData = () => {
        const { screen_id, createStore } = this.props;
        createStore.fetchData(screen_id);
    };

    handleSubmit = () => {
        const { screen_id, modalControl,  createStore, listStore } = this.props;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                createStore.save(screen_id, values,
                    () => {
                        listStore.fetchPageList();
                        modalControl.close()
                    },
                    () => modalControl.hideSaving()
                )
            }else {
                modalControl.hideSaving();
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { data, loading } = this.props.createStore;

        return (
            <Box loading={loading}>
                <Form onSubmit={this.handleSubmit} className="login-form">
                    <FormItem>
                        {getFieldDecorator('name', {
                            initialValue: data.name,
                            rules: [{ required: true, message: '请输入姓名!' }],
                        })(
                            <Input  placeholder="姓名" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('age', {
                            initialValue: data.age,
                            rules: [{ required: true, message: '请输入年龄!' }],
                        })(
                            <Input placeholder="年龄" />
                        )}
                    </FormItem>

                    <FormItem>
                        {getFieldDecorator('address', {
                            initialValue: data.address,
                            rules: [{ required: true, message: '请输入住址!' }],
                        })(
                            <Input placeholder="住址" />
                        )}
                    </FormItem>
                </Form>
            </Box>
        );
    }
}

export default Form.create()(Create);
