package uis.mytutor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ModificarResena {
    private String id;
    private Integer puntuacion;
    private String comentario;
}
