package uis.mytutor.modelo;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Materia {

    @NotNull
    private String nombre;

    // De 0 a 10
    @NotNull
    @Min(value = 0, message = "La experiencia mínima es 0")
    @Max(value = 10, message = "La experiencia máxima es 10")
    private int experiencia;
}
