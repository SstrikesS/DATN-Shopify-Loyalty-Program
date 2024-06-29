import type {ProgramType} from "~/class/program.class";
import Program from "~/class/program.class";
import EarnPointModel from "~/models/earn_point";

export type EarnPointType = ProgramType & {
    type: string,
    icon: string,
    pointValue: number,
};

export default class EarnPoint extends Program {
    private _type: string;
    private _icon: string;
    private _pointValue: number;

    constructor(data: EarnPointType) {
        super(data as ProgramType);
        this._type = data.type;
        this._icon = data.icon;
        this._pointValue = data.pointValue;
    }

    get type(){
        return this._type;
    }

    set type(value: string) {
        this._type = value;
    }

    get icon(){
        return this._icon;
    }

    set icon(value: string) {
        this._icon = value;
    }

    get pointValue(){
        return this._pointValue;
    }

    set pointValue(value: number) {
        this._pointValue = value;
    }

    async saveEarnPoint(){
        await EarnPointModel.updateOne({
            id: this.id,
            store_id: this.store_id
        }, {
            name: this.name,
            status: this.status,
            limit_usage: this.limitUsage,
            limit_reset_interval: this.limitResetInterval,
            limit_reset_value: this.limitResetValue,
            customer_eligibility: this.customerEligibility,
            point_value: this.pointValue
        })
    }
}
