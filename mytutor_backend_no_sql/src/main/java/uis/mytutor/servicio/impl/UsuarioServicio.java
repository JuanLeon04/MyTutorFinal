package uis.mytutor.servicio.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import uis.mytutor.dto.SolicitudRegistro;
import uis.mytutor.dto.UsuarioDTO;
import uis.mytutor.modelo.Usuario;
import uis.mytutor.repositorio.UsuarioRepositorio;
import uis.mytutor.servicio.interfaz.IUsuarioServicio;

import java.util.List;

@Service
public class UsuarioServicio implements IUsuarioServicio {

    @Autowired
    UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Escencial para el DTO
    public static UsuarioDTO toDTO(Usuario usuario) {
        if (usuario == null) {
            return null;
        }
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setNombreUsuario(usuario.getNombreUsuario());
        dto.setFotoPerfil(usuario.getFotoPerfil());
        dto.setActivo(usuario.isActivo());
        dto.setRol(usuario.getRol());
        return dto;
    }

    // Convertir la solicitud en un usuaro real con la contraseña cifrada
    public Usuario registroToUsuario(SolicitudRegistro solicitud) {
        if (solicitud == null) {
            return null;
        }
        Usuario usr = new Usuario();
        usr.setNombre(solicitud.getNombre());
        usr.setApellido(solicitud.getApellido());
        usr.setCorreo(solicitud.getCorreo());
        usr.setTelefono(solicitud.getTelefono());
        usr.setFotoPerfil(solicitud.getFotoPerfil());
        usr.setNombreUsuario(solicitud.getNombreUsuario());
        usr.setPassword(passwordEncoder.encode(solicitud.getPassword()));
        return usr;
    }

    // Listar todos los usuarios
    @Override
    public List<UsuarioDTO> getUsuarios() {
        return usuarioRepositorio.findAll()
                .stream()
                .map(UsuarioServicio::toDTO) // convierte cada Usuario en UsuarioDTO
                .toList();
    }

    // Obtener usuario por ID
    @Override
    public UsuarioDTO getUsuarioById(String id){
        return toDTO(usuarioRepositorio.findById(id).orElse(null));
    }

    // Obtener entidad completa (uso interno del backend)
    @Override
    public Usuario getUsuarioEntityById(String id) {
        return usuarioRepositorio.findById(id).orElse(null);
    }

    // Obtener el propio usuario
    @Override
    public Usuario getMyUsuario(Usuario usuarioActual){
        return getUsuarioEntityById(usuarioActual.getId());
    }



    private boolean isNullOrEmpty(String value) {
        return value == null || value.trim().isEmpty();
    }
    private void validarCamposUsuario(
            String nombre,
            String apellido,
            String correo,
            String telefono,
            String nombreUsuario,
            String password,
            boolean passwordObligatoria,
            boolean verificarUsernameUnico,
            String idActual // puede ser null en registro
    ) {

        if (isNullOrEmpty(nombre) ||
                isNullOrEmpty(apellido) ||
                isNullOrEmpty(correo) ||
                isNullOrEmpty(telefono) ||
                isNullOrEmpty(nombreUsuario) ||
                (passwordObligatoria && isNullOrEmpty(password)))
        {
            throw new RuntimeException("Todos los campos obligatorios deben ser enviados.");
        }

        // Validar email
        if (!correo.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new RuntimeException("El correo electrónico no es válido.");
        }

        // Teléfono
        if (!telefono.matches("^[0-9]{7,15}$")) {
            throw new RuntimeException("El número de teléfono es inválido. Debe contener entre 7 y 15 dígitos.");
        }

        // Username sin espacios
        if (nombreUsuario.contains(" ")) {
            throw new RuntimeException("El nombre de usuario no debe contener espacios.");
        }

        // Password si viene
        if (!isNullOrEmpty(password) && password.length() < 6) {
            throw new RuntimeException("La contraseña debe tener mínimo 6 caracteres.");
        }

        // Validar si el nombreUsuario ya existe (excepto si es el mismo usuario)
        if (verificarUsernameUnico) {
            Usuario existente = usuarioRepositorio.findByNombreUsuario(nombreUsuario).orElse(null);
            if (existente != null && (idActual == null || !existente.getId().equals(idActual))) {
                throw new RuntimeException("El nombre de usuario ya está en uso.");
            }
        }
    }

    // Crear usuario desde el registro
    public UsuarioDTO register(SolicitudRegistro solicitud) {

        if (solicitud == null) {
            throw new RuntimeException("La solicitud de registro no puede ser nula.");
        }

        validarCamposUsuario(
                solicitud.getNombre(),
                solicitud.getApellido(),
                solicitud.getCorreo(),
                solicitud.getTelefono(),
                solicitud.getNombreUsuario(),
                solicitud.getPassword(),
                true,   // password obligatoria
                true,   // verificar nombreUsuario único
                null    // es registro → no hay idActual
        );

        Usuario usuario = registroToUsuario(solicitud);
        Usuario guardado = usuarioRepositorio.save(usuario);

        return toDTO(guardado);
    }


    // Actualizar usuario
    // Un admin puede actualizar cualquier usuario
    // Si no es admin solo se puede actualizarse a si mismo
    public UsuarioDTO updateUsuario(Usuario datosActualizados, Usuario usuarioQueSolicita, String rolSolicitado) {

        if (datosActualizados == null) {
            throw new RuntimeException("Los datos a actualizar no pueden ser nulos.");
        }

        boolean esAdmin = usuarioQueSolicita.getRol() == Usuario.Rol.ADMIN;

        String idObjetivo = datosActualizados.getId();
        if (idObjetivo == null) {
            idObjetivo = usuarioQueSolicita.getId();
        }

        if (!esAdmin && !idObjetivo.equals(usuarioQueSolicita.getId())) {
            throw new RuntimeException("No tienes permisos para actualizar este usuario.");
        }

        Usuario existe = getUsuarioEntityById(idObjetivo);
        if (existe == null) {
            throw new RuntimeException("El usuario a actualizar no existe.");
        }

        validarCamposUsuario(
                datosActualizados.getNombre(),
                datosActualizados.getApellido(),
                datosActualizados.getCorreo(),
                datosActualizados.getTelefono(),
                datosActualizados.getNombreUsuario(),
                datosActualizados.getPassword(),
                false,  // contraseña NO obligatoria
                true,   // validar nombreUsuario único
                idObjetivo // evitar choque con su propio username
        );

        // Actualizar campos
        existe.setNombre(datosActualizados.getNombre());
        existe.setApellido(datosActualizados.getApellido());
        existe.setCorreo(datosActualizados.getCorreo());
        existe.setTelefono(datosActualizados.getTelefono());
        existe.setFotoPerfil(datosActualizados.getFotoPerfil());
        existe.setNombreUsuario(datosActualizados.getNombreUsuario());

        if (!isNullOrEmpty(datosActualizados.getPassword())) {
            existe.setPassword(passwordEncoder.encode(datosActualizados.getPassword()));
        }

        Usuario actualizado = usuarioRepositorio.save(existe);
        return toDTO(actualizado);
    }



    // Borrar usuario soft delete
    public boolean deleteUsuarioById(String id){
        Usuario usuario = getUsuarioEntityById(id); // lanza EntityNotFoundException si no existe
        if (usuario != null){
            usuario.setActivo(false);
            usuarioRepositorio.save(usuario);
            return true;
        }
        return false;
    }

    // Borrarse a si mismo soft delete
    public boolean deleteUsuario(Usuario usuarioQueSolicita){
        Usuario usuario = getUsuarioEntityById(usuarioQueSolicita.getId());
        if (usuario != null) {
            usuario.setActivo(false);
            usuarioRepositorio.save(usuario);
            return true;
        }
        return false;
    }

}
