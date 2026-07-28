const service=require("../services/product.service");

exports.getProducts=async(req,res)=>{

const products=await service.getAll();

res.json(products);

}

exports.getProduct=async(req,res)=>{

const product=await service.getById(req.params.id);

if(!product)
return res.status(404).json({
message:"Producto no encontrado"
});

res.json(product);

}

exports.createProduct=async(req,res)=>{

const product=await service.create(req.body);

res.status(201).json(product);

}

exports.updateProduct=async(req,res)=>{

const product=await service.update(req.params.id,req.body);

if(!product)
return res.status(404).json({
message:"Producto no encontrado"
});

res.json(product);

}

exports.deleteProduct=async(req,res)=>{

const product=await service.remove(req.params.id);

if(!product)
return res.status(404).json({
message:"Producto no encontrado"
});

res.json({
message:"Producto eliminado"
});

}