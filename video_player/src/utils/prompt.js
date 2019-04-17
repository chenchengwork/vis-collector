/**
 * Created by chencheng on 17-8-30.
 */
import { Modal, message } from 'antd';

class Prompt {

    constructor() {
        message.config({
            duration: 2
        });
    }

    /**
     * 提示成功
     * @param {String} msg
     * @param {Number} duration
     * @param {Function} onClose
     */
    success(msg, duration = 2, onClose = () => {}) {
        message.success(msg, duration, onClose);
    }

    /**
     * 提示错误
     * @param {String | Array} msg
     * @param {Number} duration
     * @param {Function} onClose
     */
    error(msg, duration = 2, onClose = () => {}) {
        if(Array.isArray(msg)){
            let newMsg = "";
            msg.forEach(item => newMsg += `${item.message}\n`);
            msg = newMsg;
        }

        message.error(msg, duration, onClose);
    }

    /**
     * 提示警告
     * @param {String} msg
     * @param {Number} duration
     * @param {Function} onClose
     */
    warn(msg, duration = 2, onClose = () => {}) {
        message.warn(msg, duration, onClose);
    }

    /**
     * 确认提示框
     * @param {Function} cbForOk return Promise对象
     * @param {Object} options
     */
    confirm(cbForOk, options = {}) {
        options = Object.assign({
            title: '确定删除吗？',
            // content: <h1>When clicked the OK button, this dialog will be closed after 1 second</h1>,
            content: '',    // content可以是react节点实例
            okText: '确定',
            cancelText: '取消',
            onOk() {
                const ok = cbForOk();
                if(!(ok instanceof Promise)){
                    throw new Error("confirm onOk回调方法返回的不是Promise对象");
                }
                ok.catch(e => console.error(e));
                return ok;
            },
            onCancel() {
                return null;
            },
        }, options);


        return Modal.confirm(options);
    }

}

export default new Prompt();
