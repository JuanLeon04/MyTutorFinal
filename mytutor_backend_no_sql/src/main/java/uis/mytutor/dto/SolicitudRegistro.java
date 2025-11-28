package uis.mytutor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SolicitudRegistro {
    private String nombre;
    private String apellido;
    private String correo;
    private String telefono;
    private String fotoPerfil;
    private String nombreUsuario;
    private String password;
}
