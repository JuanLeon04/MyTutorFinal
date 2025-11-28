package uis.mytutor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import uis.mytutor.modelo.Materia;
import uis.mytutor.modelo.Resena;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TutorDTO {

    private String idTutor;
    private String nombre;
    private String apellido;
    private String correo;
    private String telefono;
    private String fotoPerfil;
    private String bio;
    private double precioHora;
    private String experiencia;
    private List<Materia> materias;
    private Double califiacionPromedio;
    private List<Resena> resenas;

}
