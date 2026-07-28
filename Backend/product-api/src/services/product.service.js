const Product = require("../models/Product");

const getAll=()=>Product.findAll();

const getById=(id)=>Product.findByPk(id);

const create=(data)=>Product.create(data);

const update=async(id,data)=>{

const product=await Product.findByPk(id);

if(!product) return null;

await product.update(data);

return product;

}

const remove=async(id)=>{

const product=await Product.findByPk(id);

if(!product) return null;

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