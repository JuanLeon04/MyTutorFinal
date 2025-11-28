package uis.mytutor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SolicitudHorario {
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
}
