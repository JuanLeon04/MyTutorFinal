package uis.mytutor.modelo;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "usuario")
public class Usuario {

    @Id
    private String id;  // En MongoDB el ID es un String (ObjectId)

    @NotNull
    private String nombre;

    @NotNull
    private String apellido;

    @NotNull
    private String correo;

    @NotNull
    private String telefono;

    private String fotoPerfil;

    private boolean activo = true;

    @Indexed(unique = true)
    @NotNull
    private String nombreUsuario;

    @NotNull
    private String password;

    public enum Rol {
        ESTUDIANTE,
        TUTOR,
        ADMIN
    }
    @NotNull
    private Rol rol = Rol.ESTUDIANTE;

    private Tutor tutor;
}
