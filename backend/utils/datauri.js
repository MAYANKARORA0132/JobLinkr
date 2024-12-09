import DataUriParser from "datauri/parser.js";
import path from "path";

const getDataUri = (file) => {
    const parser = new DataUriParser();
    const extName = path.extname(file.originalname).toString(); // Get file extension
    return parser.format(extName, file.buffer);  // Use buffer for memory storage
};

export default getDataUri;