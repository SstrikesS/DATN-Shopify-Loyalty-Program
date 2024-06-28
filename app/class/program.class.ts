export default class Program {
    protected readonly _id: string;
    protected _name: string;
    protected _status: boolean;

    constructor(id: string, name: string, status: boolean) {
        this._id = id;
        this._name = name;
        this._status = status ?? true;
    }

    get status() {
        return this._status
    }

    set status(status: boolean) {
        this._status = status;
    }

    get id() {
        return this._id
    }

    get name() {
        return this._name
    }

    set name(name: string) {
        this._name = name;
    }

}
