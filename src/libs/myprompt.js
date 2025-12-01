/**
 * 信息输入提示框
 */
import { ElMessageBox } from 'element-plus';

export default function myprompt({ message, inputPattern = '', inputErrorMessage = '', title = 'Tips', type = '', inputValue = '', inputType = 'text', inputValidator = null }) {
    return new Promise((resolve, reject) => {
        ElMessageBox.prompt(message, title, {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            inputPattern: inputPattern,
            inputErrorMessage: inputErrorMessage,
            inputValue: inputValue,
            inputType,
            inputValidator,
            type: type,
        })
            .then(({ value }) => {
                resolve(value);
            })
            .catch((error) => {
                reject(error);
            });
    });
}
