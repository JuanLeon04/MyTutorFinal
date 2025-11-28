package uis.mytutor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import uis.mytutor.modelo.Usuario;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioDTO {
    private String id;
    private String nombre;
    private String apellido;
    private String nombreUsuario;
    private String fotoPerfil;
    private boolean activo;
    private Usuario.Rol rol;
}
