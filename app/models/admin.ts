import mongoose from "mongoose";

const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    status: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

export default mongoose.model('Admin', AdminSchema);



// export function addProgram() {
//
// }
//
// export function deleteProgram() {
//
// }
//
// export function updateProgram() {
//
// }
//
//
// export function getProgram() {
//
// }
