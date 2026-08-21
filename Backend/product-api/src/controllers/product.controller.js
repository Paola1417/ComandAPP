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

exports.uploadImagen = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No se recibió ningún archivo (campo 'imagen')",
    });
  }

  const url = `http://${req.get("host")}/uploads/${req.file.filename}`;

  res.status(201).json({
    url,
    filename: req.file.filename,
  });
};

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