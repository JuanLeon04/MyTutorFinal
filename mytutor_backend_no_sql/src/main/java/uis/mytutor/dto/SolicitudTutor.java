package uis.mytutor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import uis.mytutor.modelo.Materia;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SolicitudTutor {

    private String bio;
    private Double precioHora;
    private String experiencia;
    private List<Materia> materias;
}
