package uis.mytutor.servicio.interfaz;

import uis.mytutor.dto.SolicitudRegistro;
import uis.mytutor.dto.UsuarioDTO;
import uis.mytutor.modelo.Usuario;

import java.util.List;

public interface IUsuarioServicio {

    // Listar todos los usuarios
    List<UsuarioDTO> getUsuarios();

    // Obtener usuario por id
    UsuarioDTO getUsuarioById(String id);

    // Obtenerse a si mismo
    Usuario getMyUsuario(Usuario usuarioActual);

    // Obtener usuario por id (SOLO BACK)
    Usuario getUsuarioEntityById(String id);

    // Crear usuario desde el registro
    UsuarioDTO register(SolicitudRegistro solicitud);

    // Actualizar usuario
    UsuarioDTO updateUsuario(Usuario usuario, Usuario usuarioActual, String rol);

    // Borrar usuario
    boolean deleteUsuarioById(String id);

    // Borrarse a si mismo
    boolean deleteUsuario(Usuario nombreUsuario);

}
