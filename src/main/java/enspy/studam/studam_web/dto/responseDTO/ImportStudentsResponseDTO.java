package enspy.studam.studam_web.dto.responseDTO;

import lombok.Data;
import java.util.List;

@Data
public class ImportStudentsResponseDTO {
    private List<StudentResponseDTO> successfulImports;
    private List<ImportError> failedImports;
    private int totalProcessed;
    private int successCount;
    private int failureCount;

    @Data
    public static class ImportError {
        private int rowNumber;
        private String errorMessage;
        private String rawData;

        public ImportError(int rowNumber, String errorMessage, String rawData) {
            this.rowNumber = rowNumber;
            this.errorMessage = errorMessage;
            this.rawData = rawData;
        }
    }
}
