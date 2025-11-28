package uis.mytutor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResenasDTO {
    private String id;
    private String idTutor;
    private String tutorNombreApellido;
    private Integer puntuacion;
    private String comentario;
}
