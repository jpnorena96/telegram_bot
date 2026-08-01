class BaseVisaScript:
    def __init__(self, process_id, client_data):
        self.process_id = process_id
        self.client_data = client_data
        
    def run(self):
        """
        Main execution flow. Must be implemented by subclasses.
        """
        raise NotImplementedError("Subclasses must implement run()")

    def log(self, message):
        print(f"[VisaScript #{self.process_id}]: {message}")
