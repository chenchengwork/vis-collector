import PropTypes from 'prop-types';
import { Modal } from "antd";
import React, { PureComponent } from "react";

const isFunction = (data) => typeof data === 'function';

export default (WrappedComponent) => {

    return class ModalHoc extends PureComponent{
        static propTypes = {
            modalProps: PropTypes.object
        };

        state = {
            visible: false,
            saving: false,
        };

        doOk = null;
        doShow = null;
        doCancel = null;

        componentDidCatch(e){
            console.error(e);
        }

        componentDidMount(){
            this.modalControl.show(this.doShow)
        }

        handleOk = () => isFunction(this.doOk) && this.doOk();

        handleCancel = () => this.modalControl.close(this.doCancel);

        /**
         * 弹框的控制器
         * @type {{show: (function(*=): *), close: (function(*=): *), showSaving: (function(*=): *), hideSaving: (function(*=): *), registerOk: ModalHoc.modalControl.registerOk, registerCancel: ModalHoc.modalControl.registerCancel}}
         */
        modalControl = {
            show: (cb) => this.setState({ visible: true }, () => isFunction(cb) && cb()),
            close: (cb) => this.setState({ visible: false, saving: false }, () => isFunction(cb) && cb()),
            showSaving: (cb) => this.setState({ saving: true }, () => isFunction(cb) && cb()),
            hideSaving: (cb) => this.setState({ saving: false }, () => isFunction(cb) && cb()),
            registerShow: (cb) => {
                if(isFunction(cb)){
                    this.doShow = cb;
                }
            },
            registerOk: (cb, isShowSaving = true) => {
                if(isFunction(cb)){
                    if(isShowSaving){
                        this.doOk = () => this.setState({ saving: true }, () => cb())
                    }else {
                        this.doOk = cb;
                    }
                }
            },
            registerCancel: (cb) => {
                if(isFunction(cb)){
                    this.doCancel = cb;
                }
            }
        };

        render() {
            const { modalProps, ...rest } = this.props;
            const { visible, saving } = this.state;

            return (
                <Modal
                    visible={visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    confirmLoading={saving}
                    destroyOnClose={true}
                    {...modalProps}
                >
                    <WrappedComponent modalControl={this.modalControl} {...rest} />
                </Modal>
            );
        }
    }
};

