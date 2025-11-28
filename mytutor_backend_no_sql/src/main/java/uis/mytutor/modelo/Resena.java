package uis.mytutor.modelo;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resena {

    @NotNull
    private String idResena = UUID.randomUUID().toString(); // Reseña NO es un documento en mongo, pero se genera un id en back para control cada reseña

    @NotNull
    private String autorId; // id del autor

    @NotNull
    @Min(value = 0, message = "La puntuacion mínima es 0")
    @Max(value = 5, message = "La puntuacion máxima es 5")
    private Integer puntuacion;

    private String comentario;

    @NotNull
    private LocalDateTime fecha = LocalDateTime.now();
}
