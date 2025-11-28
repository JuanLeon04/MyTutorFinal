package uis.mytutor.modelo;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tutor {

    @NotNull
    private boolean activo = true;

    @NotNull
    private String bio;

    @NotNull
    private double precioHora;

    @NotNull
    private String experiencia;

    @NotNull
    private List<Materia> materias;

    private Double califiacionPromedio = 5.0;

    private List<Resena> resenas;
}
