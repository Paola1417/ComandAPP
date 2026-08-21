const Product = require("../models/Product");
const { deleteUploadedFile } = require("../middlewares/uploadMiddleware");

const getAll=()=>Product.findAll();

const getById=(id)=>Product.findByPk(id);

const create=(data)=>Product.create(data);

const update=async(id,data)=>{

const product=await Product.findByPk(id);

if(!product) return null;

const previousImage = product.imagen;

await product.update(data);

if (previousImage && data.imagen && previousImage !== data.imagen) {
  deleteUploadedFile(previousImage);
}

return product;

}

const remove=async(id)=>{

const product=await Product.findByPk(id);

if(!product) return null;

if (product.imagen) {
  deleteUploadedFile(product.imagen);
}

await product.destroy();

return true;

}

module.exports={
getAll,
getById,
create,
update,
remove
}