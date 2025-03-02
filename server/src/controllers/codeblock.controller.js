import CodeBlock from "../models/model.codeblock.js";

/**
 * Fetch all code blocks from the database
 */
export const getAllCodeBlocks = async (req, res) => {
  try {
    const codeBlocks = await CodeBlock.find({});
    res.json(codeBlocks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

/**
 * Fetch a single code block by ID
 */
export const getCodeBlockById = async (req, res) => {
  try {
    const block = await CodeBlock.findById(req.params.id);
    if (!block) {
      return res.status(404).json({ message: "CodeBlock not found" });
    }
    res.json(block);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
