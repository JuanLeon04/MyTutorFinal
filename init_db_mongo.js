db = db.getSiblingDB('mytutor');

db.createCollection("usuario");
db.createCollection("horario");

db.usuario.insertOne({
  nombre: "admin",
  apellido: "admin",
  correo: "admin",
  telefono: "admin",
  fotoPerfil: "admin",
  activo: true,
  nombreUsuario: "admin",
  password: "$2a$10$huDN.UDAL2LWn7nXxg.q5.q5nvaHVjcVw6MoLaxyecNM29dO9KeuK",
  rol: "ADMIN",
  _class: "uis.mytutor.modelo.Usuario"
});

