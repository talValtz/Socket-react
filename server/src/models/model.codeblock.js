import mongoose from "mongoose";

const codeBlockSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description:{type:String,require:false},
  current_code: { type: String,required:false, default:""},
  initial_code: { type: String, required: true },
  solution: { type: String, required: true },
  participants:{type:Number,default:0}
});

const CodeBlock = mongoose.model("CodeBlock", codeBlockSchema);
export default CodeBlock;


