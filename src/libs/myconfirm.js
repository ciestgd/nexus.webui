/**
 * 信息确定提示框
 */
 import { ElMessageBox } from 'element-plus';

 export default function myconfirm(message, title = 'Tips', type = '') {
     return new Promise((resolve) => {
         ElMessageBox.confirm(message, title, {
             confirmButtonText: 'OK',
             cancelButtonText: 'Cancel',
             type: type,
         })
             .then(() => {
                 resolve(true);
             })
             .catch(() => {
                 resolve(false);
             });
     });
 }
 