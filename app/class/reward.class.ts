import RewardModel from "~/models/reward";

export type RewardDataType = {
    id: string,
    programId: string,
    customerId: string,
    code: string,
    type: string,
    title: string,
    value: number | undefined,
    endAt: Date | undefined | null,
    startAt: Date,
    status: boolean,
}


export class RewardClass {
    private readonly _id: string;
    private readonly _programId: string;
    private readonly _customerId: string;
    private readonly _code: string;
    private readonly _type: string;
    private readonly _title: string;
    private readonly _value: number | undefined;
    private readonly _endAt: Date | undefined | null;
    private readonly _startAt: Date;
    private _status: boolean;

    constructor(data: RewardDataType) {
        this._id = data.id;
        this._programId = data.programId;
        this._customerId = data.customerId;
        this._code = data.code;
        this._type = data.type;
        this._title = data.title;
        this._value = data.value;
        this._endAt = data.endAt;
        this._startAt = data.startAt;
        this._status = data.status;
    }


    get id(): string {
        return this._id;
    }

    get programId(): string {
        return this._programId;
    }

    get customerId(): string {
        return this._customerId;
    }

    get code(): string {
        return this._code;
    }

    get type(): string {
        return this._type;
    }

    get title(): string {
        return this._title;
    }

    get value(): number | undefined {
        return this._value;
    }

    get endAt(): Date | undefined | null{
        return this._endAt;
    }

    get startAt(): Date {
        return this._startAt;
    }

    get status(): boolean {
        return this._status;
    }

    set status(value: boolean) {
        this._status = value;
    }

    async save(){
        await RewardModel.findOneAndUpdate({
            id: this.id,
            program_id: this.programId,
            customer_id: this.customerId,
        }, {
            id: this.id,
            program_id: this.programId,
            customer_id: this.customerId,
            status: this.status,
        }, {
            returnDocument: "after",
            new: true,
            lean: true,
            upsert: true,
        })
    }
}
