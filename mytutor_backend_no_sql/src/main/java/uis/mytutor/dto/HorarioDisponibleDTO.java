package uis.mytutor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import uis.mytutor.modelo.Materia;
import uis.mytutor.modelo.Resena;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HorarioDisponibleDTO {
    private String id;  // En MongoDB el ID es un String (ObjectId)
    private String idTutor;
    private String tutorNombreApellido;
    private double precioHora;
    private Double califiacionPromedio;
    private List<Materia> materias;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
}
