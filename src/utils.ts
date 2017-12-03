export class Utils{
    static includes(_arr: any[], _find): boolean{
        return _arr.findIndex(_item => _item === _find) !== -1;
    }
}