# Stage 1: 
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
ENV DOTNET_NUGET_SIGNATURE_VERIFICATION=false
COPY ["WebAPI/WebAPI/WebAPI.csproj", "WebAPI/WebAPI/"]
RUN dotnet restore "WebAPI/WebAPI/WebAPI.csproj"
COPY . .
WORKDIR "/src/WebAPI/WebAPI"
RUN dotnet publish "WebAPI.csproj" -c Release -o /app/publish

# Stage 2:
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "WebAPI.dll"]
